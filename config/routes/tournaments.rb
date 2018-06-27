resources :tournaments, concerns: :sponsorable do
  scope module: :tournaments do
    resource :qualification, only: :show
    resources :qualification_rounds, only: %i[create destroy]
    resources :qualification_jumps, only: %i[new create show edit update destroy]

    resources :rounds, only: %i[create destroy] do
      resources :matches, only: :create
    end
    resources :competitors
    resources :matches do
      scope module: :matches do
        resource :map, only: :show
        resource :globe, controller: 'globe', only: :show
        resources :slots
      end
    end
  end
end
