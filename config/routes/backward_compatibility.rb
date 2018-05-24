# Backward compatibility, app used to have locale in path, like
# /ru/controller/
# /en/controller/
get '/:locale/*path', to: redirect('/%{path}', status: 302),
                      locale: /#{I18n.available_locales.join('|')}/,
                      format: false

get '/:locale', to: redirect('/', status: 302),
                locale: /#{I18n.available_locales.join('|')}/,
                format: false

match '/track/:id', to: 'tracks#show', via: :get
match '/tracks/:track_id/google_maps', to: 'tracks/maps#show', via: :get
match '/tracks/:track_id/google_earth', to: 'tracks/globe#show', via: :get
match '/tracks/:track_id/replay', to: 'tracks/videos#show', via: :get

match '/user_profiles/:id', to: 'profiles#show', via: :get

match '/wingsuits/:id', to: 'suits#show',  via: :get
match '/wingsuits',     to: 'suits#index', via: :get
