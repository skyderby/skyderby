devise_for :users,
           controllers: { omniauth_callbacks: 'users/omniauth_callbacks',
                          registrations: 'users/registrations' }

resources :users do
  resource :masquerades, only: [:new, :destroy]
  scope module: :users do
    collection do
      resources :select_options, only: :index
    end
  end
end

resources :profiles, concerns: :flight_profiles do
  scope module: :profiles do
    resources :badges, only: [:new, :create]
    resources :tracks, only: :index
    resource :avatar, only: [:new, :create]
    resource :merge, only: [:new, :create]
    collection do
      resources :select_options, only: :index
    end
  end
end
resources :badges
