module PerformanceCompetition::ReferencePoint::CsvImportable
  extend ActiveSupport::Concern

  class_methods do # rubocop:disable Metrics/BlockLength
    def import_from_csv(file, event)
      result = parse_csv_data(file)
      return result if result[:status] == :error

      import_reference_points(result[:rows], event)
    end

    def parse_csv_data(file) # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      rows = []
      errors = []

      CSV.foreach(file.path, headers: false) do |row|
        name = row[0]&.strip
        latitude = row[1]&.strip
        longitude = row[2]&.strip

        if name.blank? || latitude.blank? || longitude.blank?
          errors << "Invalid CSV format. All fields (name, latitude, longitude) are required. Found: #{row.inspect}"
        end

        begin
          lat = Float(latitude)
          lng = Float(longitude)
        rescue ArgumentError
          errors << "Invalid coordinates. Latitude: #{latitude}, Longitude: #{longitude}"
        end

        rows << { name: name, latitude: lat, longitude: lng }
      end

      coordinate_pairs = rows.map { |row| [row[:latitude], row[:longitude]] }
      errors << 'Duplicate coordinates found in CSV' if coordinate_pairs.uniq.length != coordinate_pairs.length

      if errors.any?
        { status: :error, errors: }
      else
        { status: :success, rows: }
      end
    end

    def import_reference_points(rows, event) # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      logs = []

      event.transaction do
        rows.each do |row_data|
          existing_by_name = event.reference_points.find { |record| record.name == row_data[:name] }
          existing_by_coords = event.reference_points.find do |record|
            record.latitude == row_data[:latitude] && record.longitude == row_data[:longitude]
          end

          if existing_by_name && existing_by_coords && existing_by_name == existing_by_coords
            logs << "Reference point '#{row_data[:name]}' already exists with same coordinates"
          elsif existing_by_name
            existing_by_name.update!(
              latitude: row_data[:latitude],
              longitude: row_data[:longitude]
            )
            logs << "Updated coordinates for reference point '#{row_data[:name]}'"
          elsif existing_by_coords
            existing_by_coords.update!(name: row_data[:name])
            logs << "Updated name to '#{row_data[:name]}' " \
                    "for reference point at #{row_data[:latitude]}, #{row_data[:longitude]}"
          else
            event.reference_points.create!(row_data)
            logs << "Created new reference point '#{row_data[:name]}' " \
                    "at #{row_data[:latitude]}, #{row_data[:longitude]}"
          end
        rescue ActiveRecord::RecordInvalid => e
          logs << "Failed to process '#{row_data[:name]}': #{e.message}"
        end
      end

      { status: :success, logs: }
    end
  end
end
