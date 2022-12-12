require 'uri'
require 'net/http'
require "capybara/cuprite"

desc 'Create screenshots from speed skydiving results'
task :screenshot_results_speed, [:event_id] => [:environment] do |_task, args|
  host = "https://next.skyderby.ru"
  competition_url = "#{host}/api/v1/speed_skydiving_competitions/#{args[:event_id]}"
  results_url = URI("#{competition_url}/results.json")
  results = JSON.parse Net::HTTP.get(results_url)

  competitors_url = URI("#{competition_url}/competitors.json")
  competitors = JSON.parse Net::HTTP.get(competitors_url)

  rounds_url = URI("#{competition_url}/rounds.json")
  rounds = JSON.parse Net::HTTP.get(rounds_url)

  results.each do |result|
    competitor_data = competitors['items'].find { |c| c['id'] == result['competitorId'] }
    profile = competitors['relations']['profiles'].find { |p| p['id'] == competitor_data['profileId'] }
    round = rounds.find { |r| r['id'] == result['roundId'] }

    result['name'] = profile['name']
    result['assignedNumber'] = competitor_data['assignedNumber']
    result['round'] = round['number']
  end

  folder = "tmp/screenshots_#{args[:event_id]}"
  mkdir_p folder

  browser = Ferrum::Browser.new(timeout: 30)
  results.each do |result|
    puts "Downloading: #{result['name']} - Round #{result['round']}"
    filename = "#{result['assignedNumber']}_#{result['name'].tr(' ', '_')}_Round_#{result['round']}.png"

    result_url = "#{host}/iframes/events/speed_skydiving/#{args[:event_id]}/results/#{result['id']}"

    browser.go_to(result_url)
    browser.network.wait_for_idle(duration: 0.1, timeout: 30)
    sleep 2.5 # wait for loading and animations to finish
    browser.screenshot(path: "#{folder}/#{filename}")
    browser.reset
  end

  browser.quit
end
