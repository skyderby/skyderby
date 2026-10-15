# == Schema Information
#
# Table name: virtual_competitions
#
#  id                    :integer          not null, primary key
#  jumps_kind            :integer
#  suits_kind            :integer
#  place_id              :integer
#  period_from           :date
#  period_to             :date
#  discipline            :integer
#  discipline_parameter  :integer          default(0)
#  created_at            :datetime
#  updated_at            :datetime
#  name                  :string(510)
#  group_id              :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean
#  display_highest_gr    :boolean
#  display_on_start_page :boolean
#  default_view          :integer          default("default_overall"), not null
#  visibility            :integer          default("public_competition"), not null
#

class VirtualCompetition < ApplicationRecord
  include Intervals, Results, SuitableFinder, Membership, MultiDiscipline

  enum :jumps_kind, { skydive: 0, base: 1, speed_skydiving: 2 }
  enum :suits_kind, SuitTypes
  DISCIPLINES = {
    time: 0,
    distance: 1,
    speed: 2,
    distance_in_time: 3,
    distance_in_altitude: 4,
    flare: 5,
    base_race: 6,
    vertical_speed: 7,
    head_up_speed: 8
  }.freeze

  enum :discipline, DISCIPLINES
  enum :visibility, { public_competition: 0, unlisted_competition: 1, private_competition: 2 }
  enum :default_view, { default_overall: 0, default_last_year: 1 }

  belongs_to :place, optional: true
  belongs_to :finish_line, optional: true, class_name: 'Place::FinishLine'
  belongs_to :group

  scope :active, -> { where('period_to IS NULL OR period_to >= ?', Date.current) }
  scope :finished, -> { where(period_to: ...Date.current) }

  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable, inverse_of: :sponsorable, dependent: :delete_all
  has_many :favorites, class_name: 'VirtualCompetition::Favorite', inverse_of: :virtual_competition,
                       dependent: :delete_all
  has_many :top_entries, class_name: 'VirtualCompetition::TopEntry', inverse_of: :virtual_competition,
                         dependent: :delete_all

  delegate :name, to: :place, prefix: true, allow_nil: true
  delegate :name, to: :finish_line, prefix: true, allow_nil: true
  delegate :name, to: :group, prefix: true, allow_nil: true

  def self.results_sort_order_for(discipline) = discipline.to_s == 'base_race' ? 'ascending' : 'descending'

  def self.task_for(discipline)
    case discipline
    when 'distance_in_time', 'distance_in_altitude' then 'distance'
    when 'base_race' then 'time'
    when 'head_up_speed' then 'vertical_speed'
    else discipline
    end
  end

  def task = self.class.task_for(discipline)

  def title = [group&.name, name].compact.join(' - ')

  def worldwide?
    !place
  end

  def comparable_in_pro_view?
    return true if speed_skydiving?

    !flare? && !vertical_speed? && !head_up_speed? && !multi_discipline?
  end

  def jump_kind_filterable? = flare? && jumps_kind.nil?

  def jump_kind_options = jump_kind_filterable? ? [nil, *Ranking::JUMP_KINDS] : []

  def gender_options = [nil, *Ranking::GENDERS]

  def standings(year: nil, interval: nil, **)
    Standing.ranked(competition_ids: [id], period: Standing.period(year:, interval:), **)
  end

  def season_standings(year) = standings(year: annual? ? year : nil)

  def favorited?(user = Current.user) = user.registered? && favorites.exists?(user:)

  def favorite(user:) = favorites.find_or_create_by!(user:)

  def unfavorite(user:) = favorites.where(user:).delete_all

  def ranking(year: nil, interval: nil, **)
    year ? Ranking::Annual.new(self, year:, **) : Ranking.new(self, interval:, **)
  end

  def finished?
    period_to.present? && period_to < Date.current
  end

  def active?
    !finished?
  end
end
