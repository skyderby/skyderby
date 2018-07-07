resources :tournaments, concerns: [:sponsorable, :organizable] do
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
        resources :slots do
          scope module: :slots do
            resource :result, only: %i[new create show update destroy]
            resource :jump_range, only: %i[show update]
          end
        end
      end
    end
  end
end
