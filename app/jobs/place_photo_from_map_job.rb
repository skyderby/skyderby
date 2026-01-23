class PlacePhotoFromMapJob < ApplicationJob
  queue_as :default

  def perform(place_id)
    place = Place.find_by(id: place_id)
    return unless place
    return if place.photos.any?

    response = fetch_image(place.google_map_image_url)
    return unless response.is_a?(Net::HTTPSuccess)

    create_photo(place, response.body)
  end

  private

  def fetch_image(url)
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Get.new(uri.request_uri)
    http.request(request)
  rescue StandardError => e
    Rails.logger.error "Failed to fetch static map: #{e.message}"
    nil
  end

  def create_photo(place, image_data)
    tempfile = Tempfile.new(['static_map', '.png'])
    tempfile.binmode
    tempfile.write(image_data)
    tempfile.rewind

    photo = place.photos.new
    photo.image = tempfile
    photo.save!

    tempfile.close
    tempfile.unlink
  rescue StandardError => e
    Rails.logger.error "Failed to create photo from static map: #{e.message}"
  end
end
