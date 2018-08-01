resources :events, concerns: %i[sponsorable organizable] do
  scope module: :events do
    resource :scoreboard, only: :show

    resources :rounds do
      scope module: :rounds do
        resource :map, only: :show
        resource :globe, controller: 'globe', only: :show
        resource :reference_point_assignments, only: %i[create destroy]
      end
    end

    resources :sections do
      member do
        patch 'move_upper'
        patch 'move_lower'
      end
    end

    resources :competitors
    resources :results do
      scope module: :results do
        resource :jump_range, only: %i[show update]
        resource :penalty, only: %i[show update]
        resource :map, only: :show
      end
    end

    resource :reference_points
    resource :deletion, only: [:new, :create]
    collection do
      resources :select_options, only: :index
    end
  end
end
