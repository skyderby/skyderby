require 'fileutils'

# rake download_speed_skydiving_event_files\[25,'./tmp/download/'\]

task :download_speed_skydiving_event_files, [:event_id, :path] => [:environment] do |task, args|
  target_folder = File.expand_path(args.path)
  puts "## Downloading files to #{target_folder}"

  results = SpeedSkydivingCompetition.find(args.event_id).results

  results.find_each do |result|
    file = result.track.track_file.file
    competitor = result.competitor
    round = result.round
    filename = [
      competitor.assigned_number,
      competitor.name.gsub(' ', '_'),
      "Round_#{round.number}",
      file.original_filename
    ].select(&:present?).join('_')

    local_file = file.download
    puts "- Downloading #{filename}"
    FileUtils.cp(local_file.path, File.join(target_folder, filename))
    local_file.close!
  end

  puts "## Downloading complete"
end
