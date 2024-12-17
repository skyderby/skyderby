module Place::Photos
  extend ActiveSupport::Concern

  included do
    has_many :photos, dependent: :destroy
  end

  def cover_image_url
    photos.any? ? photos.first.image_url(:large) : google_map_image
  end

  def google_map_image
    endpoint = 'https://maps.googleapis.com/maps/api/staticmap'
    coordinates = [latitude, longitude].join(',')
    params = %W[
      center=#{coordinates}
      zoom=13
      maptype=hybrid
      size=640x250
      scale=2
      markers=color:red|#{coordinates}
      key=#{ENV.fetch('MAPS_API_KEY', nil)}
    ].join('&')

    "#{endpoint}?#{params}"
  end
end
