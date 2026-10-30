namespace :oauth do
  desc 'Create or update the public PKCE OAuth applications used by the native Apple and Android apps'
  task mobile_app: :environment do
    {
      'Skyderby Apple' => { uid: 'skyderby-apple', redirect_uri: 'io.skyderby.app://oauth/callback' },
      'Skyderby Android' => { uid: 'skyderby-android', redirect_uri: 'io.skyderby.android://oauth/callback' }
    }.each do |name, attributes|
      application = Doorkeeper::Application.find_or_initialize_by(name:)
      application.update!(**attributes, scopes: 'read write', confidential: false)

      puts "#{name} OAuth application uid: #{application.uid}"
    end
  end
end
