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
#

class Profile < ApplicationRecord
  include Ownerable, Mergeable
  include AvatarUploader::Attachment(:userpic)

  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h

  enum default_units: { metric: 0, imperial: 1 }
  enum default_chart_view: { multi: 0, single: 1 }

  belongs_to :country, optional: true

  has_many :tracks, -> { order('recorded_at DESC') }, inverse_of: :pilot, dependent: :nullify
  has_many :public_tracks,
           -> { where(visibility: 0).order('created_at DESC') },
           class_name: 'Track', inverse_of: false, dependent: :nullify
  has_many :base_tracks,
           -> { base.order('created_at DESC') }, class_name: 'Track', inverse_of: false, dependent: :nullify
  has_many :badges, -> { order(achieved_at: :desc) }, dependent: :delete_all, inverse_of: :profile
  has_many :event_competitors, class_name: 'Event::Competitor', dependent: :restrict_with_error
  has_many :personal_top_scores,
           -> { wind_cancellation(false) },
           inverse_of: :profile,
           class_name: 'VirtualCompetition::PersonalTopScore',
           dependent: :restrict_with_error
  has_many :contribution_details,
           class_name: 'Contribution::Detail',
           foreign_key: :contributor_id,
           inverse_of: :contributor,
           dependent: :restrict_with_error
  has_many :contributions, through: :contribution_details

  after_validation { userpic_derivatives! if userpic_changed? }

  delegate :name, to: :country, prefix: true, allow_nil: true
  delegate :code, to: :country, prefix: true, allow_nil: true

  validates :name, presence: true

  def cropping? = %w[crop_x crop_y crop_h crop_w].all? { |attr| public_send(attr).present? }

  def name = super.presence || 'Name not set'

  def competitor_of_events = event_competitors.select(:event_id).map(&:event)

  def participant_of_events = organizer_of_events + competitor_of_events

  class << self
    def search(query) = where('LOWER(profiles.name) LIKE LOWER(?)', "%#{query}%")
  end
end
