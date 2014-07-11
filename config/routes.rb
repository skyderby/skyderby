TrackingDerby::Application.routes.draw do

  scope "(/:locale)", locale: /#{I18n.available_locales.join("|")}/ do
    match '/tracks', :to  => 'tracks#index', :as => :track, :via => :get
    match '/track/:id', :to => 'tracks#show', :as => 'show_track', :via => :get
    match '/tracks/new', :to => 'tracks#new', :as => :new_track, :via => [:get, :post]

    match '/select_track', :to => 'track_select#track_select', :as => :track_select, :via => [:post, :get]

    match '/about', :to => 'static_pages#about', :as => :about, :via => :get
    match '/upload_error', :to => 'static_pages#upload_error', :as => :upload_error, :via => :get

    get '/:locale' => 'static_pages#index'
    root 'static_pages#index'
  end

  root to: redirect("/#{I18n.default_locale}", status: 302), as: :redirected_root

end
