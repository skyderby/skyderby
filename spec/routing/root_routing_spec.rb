describe 'Locale redirects routing', type: :request do
  %w[ru en de es].each do |locale|
    it "to #index locale: #{locale}" do
      I18n.with_locale(:en) { get("/#{locale}") }

      expect(response).to redirect_to(root_path)
    end

    it "to places#index locale: #{locale}" do
      I18n.with_locale { get("/#{locale}/places") }

      expect(response).to redirect_to(places_path)
    end
  end
end
