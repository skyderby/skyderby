TrackingDerby::Application.routes.draw do

  get '/users/autocomplete'
  get '/wingsuits/autocomplete'

  scope '/(:locale)', locale: /#{I18n.available_locales.join('|')}/ do

    # Статические страницы и маршруты
    match '/about', :to => 'static_pages#about', :as => :about, :via => :get

    # Ресурсы

    resources :tracks, :only => [:index, :show, :new, :destroy] do
      collection do
        post 'choose'
        get 'upload_error'
      end
    end
    # Для обратной совместимости
    match '/track/:id', :to => 'tracks#show', :via => :get

    resources :disciplines

    resources :events do
      resources :organizers
      resources :rounds
      resources :participation_forms, :only => [:create] do
        collection do
          patch 'approve'
          patch 'decline'
        end
      end
      resources :competitors
      resources :event_tracks
      resources :event_documents

      member do
        get 'results'
      end

    end

    get '/:locale' => 'static_pages#index'

    devise_for :users

    resources :users do
      resources :user_wingsuits
      resources :user_profile
    end

    mount RailsAdmin::Engine => '/admin', as: 'rails_admin'

    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302), as: :redirected_root

end
