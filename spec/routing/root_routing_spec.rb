require 'spec_helper'

describe 'Locale redirects routing', type: :request do
  after(:each) do
    I18n.locale = :en
  end

  %w[ru en de es].each do |locale|
    it "to #index locale: #{locale}" do
      get("/#{locale}")

      expect(response).to redirect_to(root_path)
    end

    it "to places#index locale: #{locale}" do
      get("/#{locale}/places")

      expect(response).to redirect_to(places_path)
    end
  end
end
