namespace :profiles do
  desc 'Regenerate userpic derivatives to webp format'
  task regenerate_userpics: [:environment] do
    profiles = Profile.where.not(userpic_data: nil)
    total = profiles.count
    converted = 0
    failed = 0

    puts "Found #{total} profiles with userpics"

    profiles.find_each.with_index do |profile, index|
      print "\rProcessing #{index + 1}/#{total}..."

      profile.userpic_derivatives!
      profile.save!
      converted += 1
    rescue => e
      failed += 1
      puts "\nFailed to process profile ##{profile.id}: #{e.message}"
    end

    puts "\nDone! Converted: #{converted}, Failed: #{failed}"
  end
end
