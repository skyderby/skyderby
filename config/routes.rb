TrackingDerby::Application.routes.draw do

  get '/users/autocomplete'
  get '/wingsuits/autocomplete'

  scope '/(:locale)', locale: /#{I18n.available_locales.join('|')}/ do

    # Статические страницы и маршруты
    match '/about', :to => 'static_pages#about', :as => :about, :via => :get
    match '/terms', :to => 'static_pages#terms', :as => :terms, :via => :get

    # Ресурсы

    resources :tracks, :only => [:index, :new, :show, :update, :destroy] do
      collection do
        post 'choose'
        get 'upload_error'
      end
      member do
        get 'edit'
        get 'google_maps'
        get 'google_earth'
      end
    end
    # Для обратной совместимости
    match '/track/:id', :to => 'tracks#show', :via => :get

    resources :events do
      resources :rounds
      resources :competitors
      resources :event_tracks

      member do
        get 'results'
      end

    end

    get '/:locale' => 'static_pages#index'

    devise_for :users

    resources :users do
      resources :user_profile
    end

    mount RailsAdmin::Engine => '/admin', as: 'rails_admin'

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302), as: :redirected_root

end
