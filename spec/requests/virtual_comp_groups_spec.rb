require 'rails_helper'

RSpec.describe 'VirtualCompGroups', type: :request do
  describe 'GET /virtual_comp_groups' do
    it 'works! (now write some real specs)' do
      get virtual_comp_groups_path
      expect(response).to have_http_status(200)
    end
  end
end
