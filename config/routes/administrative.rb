get '/manage', to: 'manage/dashboards#show'

authenticate :user, lambda { |u| u.has_role? :admin } do
  mount Sidekiq::Web => '/manage/sidekiq'
end

scope module: :manage do
  resources :missing_places, only: :index
  resources :accounts, only: [:index, :show]
end
