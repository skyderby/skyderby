concern :organizable do
  resources :organizers, only: %i[new create destroy]
end
