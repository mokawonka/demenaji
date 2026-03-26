Rails.application.routes.draw do
  root 'places#index'

  get '/register', to: 'registrations#new'
  post '/register', to: 'registrations#create'
  get '/login', to: 'sessions#new'
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'

  get '/Map', to: 'places#index'
  post '/Map', to: 'places#map_handler'
  post '/Index', to: 'places#map_handler'

  get '/Place/:id', to: 'places#show', as: :place
  post '/Place/:id', to: 'places#post_handler'

  get '/CreatePlace(/:id)', to: 'places#new', as: :create_place
  post '/CreatePlace', to: 'places#create'
  patch '/CreatePlace/:id', to: 'places#update', as: :update_place

  get '/Apply/:place_id', to: 'applications#new', as: :apply
  post '/Apply/:place_id', to: 'applications#create'

  get '/Favorites', to: 'favorites#index', as: :favorites
  post '/Favorites', to: 'favorites#destroy'

  get '/MyPlaces', to: 'my_places#index', as: :my_places
  post '/MyPlaces/Delete/:id', to: 'places#destroy', as: :delete_place
  post '/MyPlaces/Invite/:id/:query', to: 'my_places#invite', as: :invite_applicant
  post '/MyPlaces/Decline/:id/:query', to: 'my_places#decline', as: :decline_applicant
  post '/MyPlaces/RequestPayment/:id/:query', to: 'my_places#request_payment', as: :request_payment
  post '/MyPlaces/CancelPaymentRequest/:id/:query', to: 'my_places#cancel_payment_request', as: :cancel_payment_request

  get '/MyApplications', to: 'applications#index', as: :my_applications
  post '/MyApplications/Delete/:id', to: 'applications#destroy', as: :delete_application
end
