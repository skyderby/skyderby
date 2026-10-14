class VirtualCompetition::Standing
  class Query
    FILTERS = {
      competition_ids: 'results.virtual_competition_id IN (:competition_ids)',
      snapshot_at: 'tracks.recorded_at < :snapshot_at',
      suit_id: 'tracks.suit_id = :suit_id',
      jump_kind: 'tracks.kind = :jump_kind',
      gender: 'profiles.gender = :gender'
    }.freeze

    def initialize(period: nil, wind_cancelled: false, multi_discipline: true, **filters)
      @period = period
      @wind_cancelled = wind_cancelled
      @multi_discipline = multi_discipline
      @filters = filters.assert_valid_keys(*FILTERS.keys).compact
    end

    def to_sql = from_clause(ranked_sql)

    def personal_jumps_sql = from_clause(personal_jumps_scores_sql)

    private

    attr_reader :period, :wind_cancelled, :multi_discipline, :filters

    def from_clause(sql)
      table_name = VirtualCompetition::Standing.table_name
      Arel.sql("(#{VirtualCompetition::Standing.sanitize_sql_array([sql, binds])}) AS #{table_name}")
    end

    def ranked_sql
      scores = multi_discipline ? "(#{single_discipline_sql}) UNION ALL (#{counted_jumps_sql})" : single_discipline_sql

      <<~SQL.squish
        SELECT
          ROW_NUMBER() OVER (
            PARTITION BY scores.virtual_competition_id
            ORDER BY scores.sort_value DESC, scores.recorded_at, scores.track_id
          ) AS rank,
          scores.*
        FROM (#{scores}) AS scores
      SQL
    end

    def single_discipline_sql
      <<~SQL.squish
        SELECT DISTINCT ON (jumps.virtual_competition_id, jumps.profile_id)
          jumps.id, jumps.virtual_competition_id, jumps.track_id, jumps.discipline_id, jumps.result,
          jumps.highest_gr, jumps.highest_speed, jumps.wind_cancelled, jumps.created_at, jumps.updated_at,
          jumps.profile_id, jumps.suit_id, jumps.recorded_at, competitions.results_sort_order,
          CASE WHEN competitions.results_sort_order = 'descending' THEN jumps.result ELSE -jumps.result END AS sort_value,
          NULL::jsonb AS discipline_entries
        FROM (#{results_sql}) AS jumps
          INNER JOIN virtual_competitions competitions ON competitions.id = jumps.virtual_competition_id
        WHERE jumps.discipline_id IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM virtual_competition_disciplines disciplines
            WHERE disciplines.virtual_competition_id = jumps.virtual_competition_id
          )
        ORDER BY jumps.virtual_competition_id, jumps.profile_id, sort_value DESC, jumps.recorded_at, jumps.track_id
      SQL
    end

    def counted_jumps_sql
      <<~SQL.squish
        SELECT #{track_score_columns('field.points', 'field.best')}
        FROM (
          SELECT jumps.*, #{points_sql('jumps.result', 'jumps.best')} AS points
          FROM (
            SELECT
              counted.*,
              #{best_sql('counted.result', 'counted.virtual_competition_id, counted.discipline_id')} AS best
            FROM (
              SELECT
                pilot_jumps.*,
                FIRST_VALUE(pilot_jumps.track_id) OVER (
                  PARTITION BY pilot_jumps.virtual_competition_id, pilot_jumps.profile_id
                  ORDER BY pilot_jumps.personal_total DESC, pilot_jumps.recorded_at, pilot_jumps.track_id
                ) AS counted_track_id
              FROM (
                SELECT
                  personal.*,
                  SUM(personal.personal_points) OVER (
                    PARTITION BY personal.virtual_competition_id, personal.profile_id, personal.track_id
                  ) AS personal_total
                FROM (#{personal_points_sql}) AS personal
              ) AS pilot_jumps
            ) AS counted
            WHERE counted.track_id = counted.counted_track_id
          ) AS jumps
        ) AS field
        #{track_group_by}
      SQL
    end

    def personal_jumps_scores_sql
      <<~SQL.squish
        SELECT #{track_score_columns('field.personal_points', 'field.personal_best')}
        FROM (#{personal_points_sql}) AS field
        #{track_group_by}
      SQL
    end

    def personal_points_sql
      <<~SQL.squish
        SELECT personal.*, #{points_sql('personal.result', 'personal.personal_best')} AS personal_points
        FROM (
          SELECT
            scored.*,
            #{best_sql('scored.result', 'scored.virtual_competition_id, scored.profile_id, scored.discipline_id')}
              AS personal_best
          FROM (
            SELECT results.*, disciplines.results_sort_order = 'ascending' AS ascending
            FROM (#{results_sql}) AS results
              INNER JOIN virtual_competition_disciplines disciplines ON disciplines.id = results.discipline_id
          ) AS scored
        ) AS personal
      SQL
    end

    def track_score_columns(points, best)
      <<~SQL.squish
        MIN(field.id) AS id, field.virtual_competition_id, field.track_id, NULL::bigint AS discipline_id,
        SUM(#{points}) AS result, NULL::float AS highest_gr, NULL::float AS highest_speed,
        field.wind_cancelled, MIN(field.created_at) AS created_at, MAX(field.updated_at) AS updated_at,
        field.profile_id, field.suit_id, field.recorded_at, 'descending' AS results_sort_order,
        SUM(#{points}) AS sort_value,
        jsonb_object_agg(field.discipline_id, jsonb_build_object('result', field.result, 'best', #{best}))
          AS discipline_entries
      SQL
    end

    def track_group_by
      'GROUP BY field.virtual_competition_id, field.profile_id, field.track_id, field.suit_id, ' \
        'field.recorded_at, field.wind_cancelled'
    end

    def results_sql
      <<~SQL.squish
        SELECT
          results.id, results.virtual_competition_id, results.track_id, results.discipline_id, results.result,
          results.highest_gr, results.highest_speed, results.wind_cancelled, results.created_at, results.updated_at,
          tracks.profile_id, tracks.suit_id, tracks.recorded_at
        FROM virtual_competition_results results
          INNER JOIN tracks ON tracks.id = results.track_id
          #{'INNER JOIN profiles ON profiles.id = tracks.profile_id' if filters.key?(:gender)}
        WHERE #{conditions.join(' AND ')}
      SQL
    end

    def conditions
      [
        'results.wind_cancelled = :wind_cancelled',
        'tracks.profile_id IS NOT NULL',
        *period_conditions,
        *FILTERS.values_at(*filters.keys)
      ]
    end

    def period_conditions
      return [] unless period

      [
        ('tracks.recorded_at >= :period_from' if period.begin),
        ("tracks.recorded_at #{period.exclude_end? ? '<' : '<='} :period_to" if period.end)
      ].compact
    end

    def binds
      filters.merge(
        wind_cancelled:,
        period_from: period&.begin,
        period_to: period&.end,
        competition_ids: filters[:competition_ids].presence || [nil],
        jump_kind: filters[:jump_kind] && Track.kinds.fetch(filters[:jump_kind].to_s),
        gender: filters[:gender] && Profile.genders.fetch(filters[:gender].to_s)
      )
    end

    def best_sql(column, partition)
      "CASE WHEN ascending THEN MIN(#{column}) OVER (PARTITION BY #{partition}) " \
        "ELSE MAX(#{column}) OVER (PARTITION BY #{partition}) END"
    end

    def points_sql(result, best)
      "CASE WHEN COALESCE(#{result}, 0) = 0 OR COALESCE(#{best}, 0) = 0 THEN 0 " \
        "WHEN ascending THEN #{best} / #{result} * 100 ELSE #{result} / #{best} * 100 END"
    end
  end
end
