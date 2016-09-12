require 'rails_helper'

describe CountriesController, type: :controller do

  context 'as a regular user' do
    describe '#index, format: :json' do
      it 'responds with countries' do
        get :index, format: :json
        expect(response).to render_template(:index)
      end 
    end

    describe '#index, format: :html' do
      it 'responds with error' do
        get :index, format: :html
        expect(response).to redirect_to root_path
      end
    end

    describe '#new' do
      it 'redirects to root path' do
        post :new
        expect(response).to redirect_to root_path
      end
    end

    describe '#create' do
      it 'rejects to create a new record' do
        post :create, country: valid_attributes
        expect(response).to redirect_to root_path
      end
    end

    describe '#edit' do
      it 'redirects to root path' do
        Country.create! valid_attributes

        get :edit, id: Country.last.id
        expect(response).to redirect_to root_path
      end
    end

    describe '#update' do
      it 'rejects to update existed record' do
        Country.create! valid_attributes

        patch :update, id: Country.last.id, country: {name: 'some another name'}
        expect(response).to redirect_to root_path
      end
    end

    describe '#destroy' do
      it 'rejects to destroy record' do
        Country.create! valid_attributes

        delete :destroy, id: Country.last.id
        expect(response).to redirect_to root_path
      end
    end
  end

  def valid_attributes
    {name: 'Russia', code: 'RUS' }
  end
end
