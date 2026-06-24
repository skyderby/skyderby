namespace :qualification_jumps do
  desc 'Calculate and store the maximum developed full speed (km/h) for qualification jumps with a track'
  task calculate_top_speed: [:environment] do
    jumps = QualificationJump.where.not(track_id: nil)
    total = jumps.count
    updated = 0
    skipped = 0
    failed = 0

    puts "Found #{total} qualification jumps with a track"

    jumps.find_each.with_index do |jump, index|
      print "\rProcessing #{index + 1}/#{total}..."

      top_speed = jump.calculate_top_speed

      if top_speed
        # rubocop:disable Rails/SkipsModelValidations
        jump.update_column(:top_speed, top_speed.round(2))
        # rubocop:enable Rails/SkipsModelValidations
        updated += 1
      else
        skipped += 1
      end
    rescue StandardError => e
      failed += 1
      puts "\nFailed to process qualification jump ##{jump.id}: #{e.message}"
    end

    puts "\nDone. Updated: #{updated}, skipped: #{skipped}, failed: #{failed}"
  end
end
