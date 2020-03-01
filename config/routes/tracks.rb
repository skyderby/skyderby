resources :track_files, only: [:create, :show] do
  scope module: :track_files do
    resource :track, only: :create
  end
end

resources :tracks, only: [:index, :show, :edit, :update, :destroy] do
  scope module: :tracks do
    resource :ownership, only: [:show, :update]
    resource :map, only: :show
    resource :globe, controller: 'globe', only: :show
    resource :wind_data, controller: 'globe', only: :show
    resource :results, controller: 'globe', only: :show
    resource :video, only: [:new, :edit, :show, :create, :update, :destroy] do
      resource :chart_data, only: :show, module: :videos
    end
    resource :results, only: :show
    resource :download, only: :show
    resource :flight_profile, only: :show
    resource :jump_range, only: :show
    resource :altitude_data, only: :show
    resource :weather_data

    collection do
      resource :upload, only: :new, as: :tracks_upload
      resources :select_options, only: :index
    end
  end
end
