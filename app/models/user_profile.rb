class UserProfile < ActiveRecord::Base
  enum default_units: [:metric, :imperial]
  enum default_chart_view: [:multi, :single]

  belongs_to :user

  has_many :tracks, -> { order('created_at DESC') }
  has_many :public_tracks,
           -> { where(visibility: 0).order('created_at DESC') },
           class_name: 'Track'
  has_many :badges
  has_many :event_organizers

  has_attached_file :userpic,
                    styles: { large: '500x500>',
                              medium: '150x150#',
                              thumb: '32x32#' },
                    default_url: '/images/:style/missing.png'

  validates_attachment_content_type :userpic, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']

  # Возвращает массив ID соревнований в которых является организатором
  def organizer_of_events
    event_organizers.pluck(:event_id)
  end

  class << self
    def search(query)
      where('LOWER(name) LIKE LOWER(?)', "%#{query}%")
    end
  end
end
