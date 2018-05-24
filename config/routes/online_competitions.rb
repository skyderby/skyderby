resources :virtual_competitions, concerns: :sponsorable do
  scope module: :virtual_competitions do
    collection do
      resources :groups, as: :virtual_competition_groups
    end

    resource :person_details, only: :show
    resource :overall, only: :show
    resources :year, only: :show, param: :year
    resources :periods, only: :show
  end
end
resources :virtual_comp_results
