match '/competitions', to: 'static_pages#competitions', as: :competitions, via: :get
match '/about', to: 'static_pages#about', as: :about, via: :get
get '/ping' => 'static_pages#ping'
