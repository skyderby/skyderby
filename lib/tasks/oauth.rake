namespace :oauth do
  desc 'Create or update the public PKCE OAuth application used by the native Apple app'
  task mobile_app: :environment do
    application = Doorkeeper::Application.find_or_initialize_by(name: 'Skyderby Apple')
    application.update!(
      uid: 'skyderby-apple',
      redirect_uri: 'io.skyderby.app://oauth/callback',
      scopes: 'read write',
      confidential: false
    )

    puts "Skyderby Apple OAuth application uid: #{application.uid}"
  end
end
