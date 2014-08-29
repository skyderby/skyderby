require 'rails_helper'

RSpec.describe DisciplinesController, :type => :controller do

  describe 'GET show' do
    it 'returns http success' do
      get :show
      expect(response).to be_success
    end
  end

  describe 'GET new' do
    it 'returns http success' do
      get :new
      expect(response).to be_success
    end
  end

end
