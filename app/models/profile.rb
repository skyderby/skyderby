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

  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h

  enum default_units: [:metric, :imperial]
  enum default_chart_view: [:multi, :single]

  belongs_to :country, optional: true

  has_many :tracks, -> { order('recorded_at DESC') }
  has_many :public_tracks,
           -> { where(visibility: 0).order('created_at DESC') },
           class_name: 'Track'
  has_many :base_tracks, -> { base.order('created_at DESC') }, class_name: 'Track'
  has_many :badges, -> { order(achieved_at: :desc) }, dependent: :delete_all
  has_many :event_competitors, class_name: 'Event::Competitor', dependent: :restrict_with_error
  has_many :personal_top_scores, class_name: 'VirtualCompetition::PersonalTopScore'

  has_attached_file :userpic,
                    styles: { large: '500x500>',
                              medium: '150x150#',
                              thumb: '32x32#' },
                    processors: [:jcropper],
                    default_url: '/images/:style/missing.png'

  delegate :name, to: :country, prefix: true, allow_nil: true
  delegate :code, to: :country, prefix: true, allow_nil: true

  validates :name, presence: true

  validates_attachment_content_type :userpic, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']

  def cropping?
    %w[crop_x crop_y crop_h crop_w].all? { |attr| public_send(attr).present? }
  end

  def name
    super.presence || 'Name not set'
  end

  def competitor_of_events
    event_competitors.select(:event_id).map(&:event)
  end

  def participant_of_events
    organizer_of_events + competitor_of_events
  end

  class << self
    def search(query)
      where('LOWER(profiles.name) LIKE LOWER(?)', "%#{query}%")
    end
  end
end
