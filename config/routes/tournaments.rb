resources :tournaments, concerns: [:sponsorable, :organizable] do
  scope module: :tournaments do
    resource :qualification, only: :show do
      scope module: :qualifications do
        resources :rounds, only: %i[create destroy]

        resources :results, except: :index do
          scope module: :results do
            resource :jump_range, only: %i[show update]
          end
        end
      end
    end

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

    collection do
      resources :select_options, only: :index
    end
  end
end
