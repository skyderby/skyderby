resources :manufacturers
resources :suits do
  scope module: :suits do
    collection do
      resources :select_options, only: :index
    end
  end
end
