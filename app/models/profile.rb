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
#  user_id              :integer
#  facebook_profile     :string(510)
#  vk_profile           :string(510)
#  dropzone_id          :integer
#  crop_x               :integer
#  crop_y               :integer
#  crop_w               :integer
#  crop_h               :integer
#  default_units        :integer          default("metric")
#  default_chart_view   :integer          default("multi")
#  country_id           :integer
#

class Profile < ApplicationRecord
  enum default_units: [:metric, :imperial]
  enum default_chart_view: [:multi, :single]

  belongs_to :user, optional: true
  belongs_to :country, optional: true

  has_many :tracks, -> { order('created_at DESC') }
  has_many :public_tracks,
           -> { where(visibility: 0).order('created_at DESC') },
           class_name: 'Track'
  has_many :badges
  has_many :event_organizers
  has_many :competitors
  has_many :personal_top_scores

  has_attached_file :userpic,
                    styles: { large: '500x500>',
                              medium: '150x150#',
                              thumb: '32x32#' },
                    default_url: '/images/:style/missing.png'

  delegate :name, to: :country, prefix: true, allow_nil: true
  delegate :code, to: :country, prefix: true, allow_nil: true

  validates_attachment_content_type :userpic, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']

  # returns array of competition ID's where organizer
  def organizer_of_events
    event_organizers.pluck(:event_id)
  end

  def competitor_of_events
    competitors.pluck(:event_id)
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
