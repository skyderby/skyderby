resources :track_files, only: [:create, :show] do
  scope module: :track_files do
    resource :track, only: :create
  end
end

resources :tracks, only: [:index, :show, :edit, :update, :destroy] do
  scope module: :tracks do
    resource :map, only: :show
    resource :globe, controller: 'globe', only: :show
    resource :video, only: [:new, :edit, :show, :create, :update, :destroy]
    resource :results, only: :show
    resource :download, only: :show
    resource :flight_profile, only: :show
    resource :jump_range, only: :show
    resource :altitude_data, only: :show

    collection do
      resources :select_options, only: :index
    end
  end

  resources :weather_data
end
