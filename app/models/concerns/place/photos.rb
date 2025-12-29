module Place::Photos
  extend ActiveSupport::Concern

  included do
    has_many :photos, dependent: :destroy
  end

  def cover_image_url
    if photos.any?
      photos.first.image_url(:large)
    else
      PlacePhotoFromMapJob.perform_later(id)
      google_map_image_url
    end
  end

  def google_map_image_url
    center = [latitude, longitude].join(',')

    'https://maps.googleapis.com/maps/api/staticmap' + {
      center:,
      zoom: 13,
      maptype: 'hybrid',
      size: '640x250',
      scale: 2,
      markers: "color:red|#{center}",
      key: ENV.fetch('MAPS_API_KEY', nil)
    }.to_param
  end
end
