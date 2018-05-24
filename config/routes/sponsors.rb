concern :sponsorable do
  resources :sponsors, only: [:new, :create, :destroy]
  scope module: :sponsors do
    resource :sponsors_copy, only: [:new, :create]
  end
end
