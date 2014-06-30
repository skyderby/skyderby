TrackingDerby::Application.routes.draw do

  match '/tracks', :to  => 'tracks#index', :as => :track, :via => :get
  match '/track/:id', :to => 'tracks#show', :as => 'show_track', :via => :get
  match '/tracks/new', :to => 'tracks#new', :as => :new_track, :via => [:get, :post]

  match '/select_track', :to => 'track_select#track_select', :as => :track_select, :via => [:post, :get]

  match '/about', :to => 'static_pages#about', :as => :about, :via => :get
  match '/upload_error', :to => 'static_pages#upload_error', :as => :upload_error, :via => :get

  root 'static_pages#index'

end
