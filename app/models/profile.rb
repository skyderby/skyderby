# == Schema Information
#
# Table name: profiles
#
#  id                   :integer          not null, primary key
#  last_name            :string(510)
#  first_name           :string(510)
#  name                 :string(510)
#  userpic_file_name    :string(510)
#  userpic_content_type :string(510)
#  userpic_file_size    :integer
#  userpic_updated_at   :datetime
#  default_units        :integer          default("metric")
#  default_chart_view   :integer          default("multi")
#  country_id           :integer
#  owner_type           :string
#  owner_id             :integer
#  gender               :integer
#

class Profile < ApplicationRecord
  include Ownerable, Mergeable, Permissions
  include AvatarUploader::Attachment(:userpic)

  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h, :require_country

  NameOption = Data.define(:profile_id, :alias_id, :name, :country_id, :country_name, :country_code)

  MIN_NAME_QUERY_LENGTH = 3

  enum :default_units, { metric: 0, imperial: 1 }
  enum :default_chart_view, { multi: 0, single: 1 }
  enum :gender, { male: 0, female: 1, other: 2 }

  belongs_to :country, optional: true

  has_many :aliases, class_name: 'Profile::Alias', inverse_of: :profile, dependent: :delete_all
  has_many :tracks, inverse_of: :pilot, dependent: :nullify
  has_many :public_tracks,
           -> { where(visibility: 0).order(created_at: :desc) },
           class_name: 'Track', inverse_of: false, dependent: :nullify
  has_many :base_tracks,
           -> { base.order(created_at: :desc) }, class_name: 'Track', inverse_of: false, dependent: :nullify
  has_many :badges, -> { order(achieved_at: :desc) }, dependent: :delete_all, inverse_of: :profile
  has_many :performance_competition_participation,
           class_name: 'PerformanceCompetition::Competitor',
           dependent: :restrict_with_error
  has_many :speed_skydiving_competition_participations,
           class_name: 'SpeedSkydivingCompetition::Competitor',
           inverse_of: :profile,
           dependent: :restrict_with_error
  has_many :boogie_participations,
           class_name: 'Boogie::Competitor',
           inverse_of: :profile,
           dependent: :restrict_with_error
  has_many :tournament_participations,
           class_name: 'Tournament::Competitor',
           inverse_of: :profile,
           dependent: :restrict_with_error
  has_many :events, through: :performance_competition_participation
  has_many :speed_skydiving_competitions,
           through: :speed_skydiving_competition_participations,
           source: :event,
           dependent: :restrict_with_error
  has_many :personal_top_scores,
           -> { wind_cancellation(false) },
           inverse_of: :profile,
           class_name: 'VirtualCompetition::PersonalTopScore',
           dependent: :restrict_with_error
  has_many :contribution_details, class_name: 'Contribution::Detail', dependent: :restrict_with_error
  has_many :contributions, through: :contribution_details

  after_validation { userpic_derivatives! if userpic_changed? }

  delegate :name, to: :country, prefix: true, allow_nil: true
  delegate :code, to: :country, prefix: true, allow_nil: true

  validates :name, presence: true
  validates :country, presence: true, if: :require_country

  def cropping? = %w[crop_x crop_y crop_h crop_w].all? { |attr| public_send(attr).present? }

  def name
    return super if new_record?

    super.presence || 'Name not set'
  end

  def competitor_of_events = events + speed_skydiving_competitions

  def participant_of_events = organizer_of_events + competitor_of_events

  def contributor?
    donor? || (belongs_to_user? && owner.subscribed?)
  end

  class << self
    def search(query)
      pattern = "%#{sanitize_sql_like(query.to_s)}%"

      left_joins(:aliases)
        .where(
          'unaccent(profiles.name) ILIKE unaccent(:q) ' \
          'OR unaccent(profile_aliases.name) ILIKE unaccent(:q)',
          q: pattern
        )
        .distinct
    end

    def name_options(query, limit: 20)
      term = query.to_s.strip
      return [] if term.length < MIN_NAME_QUERY_LENGTH

      pattern = "%#{sanitize_sql_like(term)}%"

      options =
        canonical_name_options(pattern, limit) + alias_name_options(pattern, limit)

      options.sort_by { |option| option.name.to_s.downcase }.first(limit)
    end

    def resolve_name(query)
      term = query.to_s.strip
      return if term.blank?

      exact = sanitize_sql_like(term)
      candidates =
        where('unaccent(profiles.name) ILIKE unaccent(?)', exact).limit(2).pluck(:id).map { |id| [id, nil] } +
        Profile::Alias.where('unaccent(profile_aliases.name) ILIKE unaccent(?)', exact)
                      .limit(2).pluck(:profile_id, :id)

      return unless candidates.map(&:first).uniq.one?

      candidates.find { |_profile_id, alias_id| alias_id.nil? } || candidates.first
    end

    private

    def canonical_name_options(pattern, limit)
      includes(:country)
        .where('unaccent(profiles.name) ILIKE unaccent(?)', pattern)
        .order(:name).limit(limit)
        .map do |profile|
          NameOption.new(profile.id, nil, profile.name, profile.country_id,
                         profile.country_name, profile.country_code)
        end
    end

    def alias_name_options(pattern, limit)
      matches = Profile::Alias.includes(profile: :country)
                              .where('unaccent(profile_aliases.name) ILIKE unaccent(?)', pattern)
                              .order(:name).limit(limit)

      matches.map do |profile_alias|
        profile = profile_alias.profile
        NameOption.new(profile.id, profile_alias.id, profile_alias.name, profile.country_id,
                       profile.country_name, profile.country_code)
      end
    end
  end
end
