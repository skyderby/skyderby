Skyderby::Application.routes.draw do
  scope '/(:locale)', locale: /#{I18n.available_locales.join('|')}/ do
    # Static pages and routes
    match '/competitions', to: 'static_pages#competitions', as: :competitions, via: :get
    match '/about', to: 'static_pages#about', as: :about, via: :get
    match '/terms', to: 'static_pages#terms', as: :terms, via: :get
    match '/manage', to: 'static_pages#manage', as: :manage, via: :get

    resources :tracks, only: [:index, :new, :show, :edit, :update, :destroy] do
      collection do
        post 'choose'
        get 'upload_error'
      end
      member do
        get 'google_maps'
        get 'google_earth'
        get 'replay'
      end
    end
    # Backward compatibility
    match '/track/:id', to: 'tracks#show', via: :get

    # Help
    get 'help'                  => 'help#index'
    get 'help/:category/:file'  => 'help#show', as: :help_page, constraints: { category: /.*/, file: /[^\/\.]+/ }
    get 'help/about'

    resources :events do
      resources :sections, only: [:create, :update, :destroy] do
        collection do
          post 'reorder'
        end
      end

      resources :rounds
      resources :competitors
      resources :event_tracks
    end

    devise_for :users
    resources :users
    resources :user_profiles
    resources :badges

    resources :manufacturers
    resources :wingsuits

    resources :countries
    resources :places

    resources :virtual_competitions
    resources :virtual_comp_groups
    resources :virtual_comp_results

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302),
       as: :redirected_root

  namespace :api, default: { format: :json } do
    namespace :v1 do
    end
  end
end
