module Profiles
  class Dashboard < SimpleDelegator
    MODES = %i[performance base speed].freeze
    ACTIVITY_BY_MODE = { performance: :skydive, base: :base, speed: :speed_skydiving }.freeze
    DISCIPLINES_BY_MODE = { base: %i[distance_in_time flare], speed: %i[vertical_speed] }.freeze
    DISCIPLINES = %i[speed distance time flare].freeze
    BASE_RACES_LIMIT = 3
    RANKINGS_LIMIT = 4

    Ranking = Struct.new(:competition, :result, :rank, :total, :rank_delta, :result_ahead, :result_behind,
                         keyword_init: true)
    PersonalBest = Struct.new(:discipline, :result, :competition, :delta, :track_id, keyword_init: true)
    CompetitionEntry = Struct.new(:event, :place, :live, :hidden_place, keyword_init: true)
    LiveCompetition = Struct.new(:event, :location, :athletes_count, keyword_init: true)

    LIVE_COMPETITIONS_PERIOD = 2.weeks

    def initialize(profile, user: nil, mode: nil, rankings_gender: nil)
      super(profile)
      @user = user
      @requested_mode = mode.presence&.to_sym
      @requested_gender = rankings_gender.presence&.to_sym
    end

    def profile = __getobj__

    def available_modes
      @available_modes ||= MODES.select { |mode| mode_available?(mode) }
    end

    def any_modes? = available_modes.any?

    RECENT_TRACKS_FOR_MODE = 20

    def current_mode
      @current_mode ||=
        [@requested_mode, stored_mode]
        .compact
        .find { |mode| available_modes.include?(mode) } || default_mode
    end

    def default_mode
      recent_kinds = tracks.order(recorded_at: :desc).limit(RECENT_TRACKS_FOR_MODE).pluck(:kind).tally
      available_modes.max_by { |mode| recent_kinds[ACTIVITY_BY_MODE.fetch(mode).to_s] || 0 } ||
        available_modes.first
    end

    def user_setting = @user&.registered? ? @user.setting : nil

    def stored_mode = user_setting&.dashboard_mode&.to_sym

    def current_activity = ACTIVITY_BY_MODE.fetch(current_mode, :skydive)

    def rankings_gender_toggle? = female?

    def female_rankings?
      return false unless female?
      return @requested_gender == :female unless @requested_gender.nil?

      user_setting&.dashboard_female_rankings || false
    end

    def rankings_gender = female_rankings? ? :female : :open

    def personal_bests
      DISCIPLINES.map { |discipline| discipline == :flare ? flare_pb : personal_best(discipline) }
    end

    def base_flare = flare_pb

    def base_race_bests(limit = BASE_RACES_LIMIT)
      activity_scores
        .reject { |score| score.virtual_competition.discipline == 'flare' }
        .group_by { |score| [score.virtual_competition.discipline, score.virtual_competition.discipline_parameter] }
        .map { |_key, scores| build_personal_best(scores) }
        .sort_by { |best| best.competition.discipline_parameter.to_i }
        .first(limit)
    end

    def speed_pb = speed_result_values.max

    def speed_pb_track_id = speed_results.max_by(&:first)&.last

    def speed_p95
      return if speed_result_values.empty?

      percentile(speed_result_values, 95)
    end

    def jumps_count
      @jumps_count ||= tracks.where(kind: current_activity).count
    end

    def locations_count
      @locations_count ||=
        tracks.where(kind: current_activity).where.not(place_id: nil).distinct.count(:place_id)
    end

    def rankings
      @rankings ||= build_rankings
    end

    def recent_tracks(limit = 5)
      tracks.where(kind: current_activity)
            .includes(:suit, :place, :time, :distance, :speed)
            .order(recorded_at: :desc)
            .limit(limit)
    end

    def competitions
      @competitions ||=
        competition_participations
        .map { |competitor| [competitor, competition_event(competitor)] }
        .select { |_competitor, event| visible_competition?(event) }
        .sort_by { |_competitor, event| event.starts_at || Date.new(0) }
        .reverse
        .map { |competitor, event| competition_entry(competitor, event) }
    end

    def live_competitions
      @live_competitions ||= build_live_competitions
    end

    def recent_badges(limit = 3) = badges.first(limit)

    def pro? = @user&.subscription_active? || false

    private

    def build_live_competitions
      period = LIVE_COMPETITIONS_PERIOD.ago.to_date..Time.zone.today
      scopes = [PerformanceCompetition.public_event, Boogie.public_event,
                SpeedSkydivingCompetition.public_event, Tournament.all]

      scopes
        .flat_map { |scope| scope.where(status: %i[published surprise], starts_at: period).includes(:place).to_a }
        .sort_by(&:starts_at)
        .reverse
        .map { |event| live_competition_entry(event) }
    end

    def live_competition_entry(event)
      LiveCompetition.new(event:, location: event.place&.name, athletes_count: event.competitors.count)
    end

    def competition_participations
      performance_competition_participation.includes(:event).to_a +
        speed_skydiving_competition_participations.includes(:event).to_a +
        tournament_participations.includes(:tournament).to_a
    end

    def competition_event(competitor)
      competitor.respond_to?(:event) ? competitor.event : competitor.tournament
    end

    def competition_entry(competitor, event)
      CompetitionEntry.new(
        event: event,
        place: competitor.try(:rank),
        live: event.status != 'finished' && !event.surprise?,
        hidden_place: event.surprise?
      )
    end

    def visible_competition?(event)
      return false unless event.respond_to?(:starts_at)
      return false if event.draft?

      event.respond_to?(:public_event?) ? event.public_event? : true
    end

    def mode_available?(mode)
      case mode
      when :performance then tracks.skydive.exists?
      when :base then tracks.base.exists?
      when :speed then tracks.speed_skydiving.exists?
      end
    end

    def personal_best(discipline)
      scores = activity_scores.select { |score| score.virtual_competition.discipline == discipline.to_s }
      return if scores.empty?

      build_personal_best(scores)
    end

    def build_personal_best(scores)
      best = scores.max_by { |score| sort_value(score.virtual_competition, score.result) }
      PersonalBest.new(
        discipline: best.virtual_competition.discipline.to_sym,
        result: best.result,
        competition: best.virtual_competition,
        delta: previous_pb_delta(best.virtual_competition),
        track_id: best.track_id
      )
    end

    def flare_pb
      flare_scores = activity_scores.select { |score| score.virtual_competition.discipline == 'flare' }
      return if flare_scores.empty?

      competition = flare_scores.first.virtual_competition
      ranked = flare_results(flare_scores.map(&:virtual_competition_id)).sort_by do |result|
        sort_value(competition, result)
      end
      return if ranked.empty?

      PersonalBest.new(
        discipline: :flare,
        result: ranked.last,
        competition: competition,
        delta: ranked.size < 2 ? nil : signed_improvement(competition, ranked.last - ranked[-2])
      )
    end

    def flare_results(competition_ids)
      VirtualCompetition::Result
        .wind_cancellation(false)
        .where(virtual_competition_id: competition_ids)
        .joins(:track)
        .where(tracks: { profile_id: id, kind: Track.kinds[current_activity] })
        .pluck(:result)
    end

    def activity_scores
      @activity_scores ||= begin
        scope = personal_top_scores
                .joins(:virtual_competition)
                .merge(VirtualCompetition.by_activity(current_activity).worldwide)
        disciplines = DISCIPLINES_BY_MODE[current_mode]
        scope = scope.merge(VirtualCompetition.where(discipline: disciplines)) if disciplines
        scope.includes(:virtual_competition).to_a
      end
    end

    def build_rankings
      competition_ids = activity_scores.map(&:virtual_competition_id).uniq
      return [] if competition_ids.empty?

      current = competition_scores(VirtualCompetition::AnnualTopScore.for_year(current_year), competition_ids)
      previous = competition_scores(VirtualCompetition::AnnualTopScore.at_snapshot(1.week.ago).for_year(current_year),
                                    competition_ids)
      rankings_from(competition_ids, current, previous).sort_by(&:rank)
    end

    def competition_scores(relation, competition_ids)
      associations = female_rankings? ? %i[track profile] : %i[track]
      relation.where(virtual_competition_id: competition_ids)
              .includes(associations).to_a.group_by(&:virtual_competition_id)
    end

    def rankings_from(competition_ids, current, previous)
      competitions = VirtualCompetition.where(id: competition_ids).index_by(&:id)

      competition_ids.filter_map do |competition_id|
        ranking_in(competitions[competition_id], current[competition_id] || [], previous[competition_id] || [])
      end
    end

    def ranking_in(competition, current_siblings, previous_siblings)
      ranked = rank_candidates(competition, current_siblings)
      position = ranked.index { |score| score.profile_id == id }
      return unless position

      Ranking.new(
        competition: competition,
        result: ranked[position].result,
        rank: position + 1,
        total: ranked.size,
        rank_delta: previous_rank_delta(competition, previous_siblings, position + 1),
        result_ahead: position.zero? ? nil : ranked[position - 1].result,
        result_behind: ranked[position + 1]&.result
      )
    end

    def previous_rank_delta(competition, previous_siblings, rank)
      position = rank_candidates(competition, previous_siblings).index { |score| score.profile_id == id }
      position && (position + 1 - rank)
    end

    def rank_candidates(competition, siblings)
      candidates = jump_kind_filtered?(competition) ? same_kind(siblings) : siblings
      candidates = only_female(candidates) if female_rankings?
      candidates = candidates.sort_by(&:result)
      candidates.reverse! if competition.results_sort_order == 'descending'
      candidates
    end

    def same_kind(siblings)
      siblings.select { |score| score.track&.kind == current_activity.to_s }
    end

    def only_female(siblings)
      siblings.select { |score| score.profile&.female? }
    end

    def jump_kind_filtered?(competition)
      competition.flare? && competition.jumps_kind.nil?
    end

    def previous_pb_delta(competition)
      results = VirtualCompetition::Result
                .wind_cancellation(false)
                .where(virtual_competition: competition)
                .joins(:track)
                .where(tracks: { profile_id: id })
                .pluck(:result)
      ranked = results.sort_by { |result| sort_value(competition, result) }
      return if ranked.size < 2

      signed_improvement(competition, ranked.last - ranked[-2])
    end

    def signed_improvement(competition, difference)
      difference = -difference unless competition.results_sort_order == 'descending'
      difference.zero? ? nil : difference
    end

    def sort_value(competition, result)
      competition.results_sort_order == 'descending' ? result : -result
    end

    def speed_result_values = speed_results.map(&:first)

    def speed_results
      @speed_results ||=
        VirtualCompetition::Result
        .wind_cancellation(false)
        .where(virtual_competition_id: activity_scores.map(&:virtual_competition_id).uniq)
        .joins(:track)
        .where(tracks: { profile_id: id })
        .pluck(:result, :track_id)
    end

    def percentile(values, rank)
      sorted = values.sort
      return sorted.last if sorted.one?

      position = (rank / 100.0) * (sorted.length - 1)
      lower = sorted[position.floor]
      upper = sorted[position.ceil]
      lower + ((upper - lower) * (position - position.floor))
    end

    def current_year = Time.zone.now.year
  end
end
