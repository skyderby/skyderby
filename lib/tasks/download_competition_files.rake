require 'fileutils'

# rake download_competition_files\[25,'./tmp/download/'\]

task :download_competition_files, [:event_id, :path] => [:environment] do |task, args|
  target_folder = File.expand_path(args.path)
  puts "## Downloading files to #{target_folder}"

  results = Event.find(args.event_id).results

  results.find_each do |result|
    file = result.track.track_file.file
    competitor = result.competitor
    round = result.round
    filename = "#{competitor.assigned_number}_#{round.discipline.capitalize}_#{round.number}_#{file.original_filename}"

    local_file = file.download
    puts "- Downloading #{filename}"
    FileUtils.cp(local_file.path, File.join(target_folder, filename))
    local_file.close!
  end

  puts "## Downloading complete"
end
