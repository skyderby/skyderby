class VirtualCompetition::Standing < ApplicationRecord
  self.table_name = 'virtual_competition_results'
  self.implicit_order_column = :rank

  belongs_to :virtual_competition
  belongs_to :track
  belongs_to :profile
  belongs_to :suit, optional: true

  default_scope { from(Query.new.to_sql) }

  scope :single_discipline_rankings, -> { from(Query.new(multi_discipline: false).to_sql) }

  def self.ranked(**) = unscoped.from(Query.new(**).to_sql)

  def self.personal_jumps(**) = unscoped.from(Query.new(**).personal_jumps_sql)

  def self.podium_places_of(track)
    competition_ids = track.all_virtual_competition_results.distinct.pluck(:virtual_competition_id)
    return [] if competition_ids.empty?

    [false, true].flat_map do |wind_cancelled|
      ranked(competition_ids:, wind_cancelled:, multi_discipline: false)
        .where(track_id: track.id)
        .where(rank: ..VirtualCompetition::Ranking::PODIUM_SIZE)
        .to_a
    end
  end

  def self.period(year: nil, interval: nil)
    if year.present?
      Date.new(year.to_i)...Date.new(year.to_i + 1)
    elsif interval
      interval.recorded_range
    end
  end

  def entries
    @entries ||= virtual_competition.disciplines.map do |discipline|
      entry = discipline_entries.to_h.fetch(discipline.id.to_s, {})
      Entry.new(discipline:, result: entry['result']&.to_f, best: entry['best']&.to_f)
    end
  end

  def readonly? = true
end
