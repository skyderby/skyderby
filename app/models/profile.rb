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
  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h

  enum default_units: [:metric, :imperial]
  enum default_chart_view: [:multi, :single]

  belongs_to :country, optional: true
  belongs_to :owner, polymorphic: true, optional: true

  has_many :tracks, -> { order('recorded_at DESC') }
  has_many :public_tracks,
           -> { where(visibility: 0).order('created_at DESC') },
           class_name: 'Track'
  has_many :base_tracks, -> { base.order('created_at DESC') }, class_name: 'Track'
  has_many :badges, -> { order(achieved_at: :desc) }, dependent: :delete_all
  has_many :events, dependent: :restrict_with_error
  has_many :organizers, dependent: :restrict_with_error
  has_many :competitors, dependent: :restrict_with_error
  has_many :personal_top_scores

  scope :owned_by_users, -> do
    joins("INNER JOIN users ON owner_id = users.id AND owner_type = 'User'")
  end

  has_attached_file :userpic,
                    styles: { large: '500x500>',
                              medium: '150x150#',
                              thumb: '32x32#' },
                    processors: [:jcropper],
                    default_url: '/images/:style/missing.png'

  delegate :name, to: :country, prefix: true, allow_nil: true
  delegate :code, to: :country, prefix: true, allow_nil: true

  validates_attachment_content_type :userpic, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']

  def cropping?
    %w[crop_x crop_y crop_h crop_w].all? { |attr| public_send(attr).present? }
  end

  def name
    super.presence || 'Name not set'
  end

  # returns array of competition ID's where organizer
  def organizer_of_events
    organizers.select(:organizable_id, :organizable_type).map(&:organizable)
  end

  def competitor_of_events
    competitors.pluck(:event_id)
  end

  def participant_of_events
    organizer_of_events + competitor_of_events
  end

  def responsible_of_events
    events
  end

  def belongs_to_user?
    owner_type == 'User'
  end

  def belongs_to_event?
    owner_type == 'Event'
  end

  def belongs_to_tournament?
    owner_type == 'Tournament'
  end

  class << self
    def search(query)
      where('LOWER(profiles.name) LIKE LOWER(?)', "%#{query}%")
    end
  end
end
