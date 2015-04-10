require "rails_helper"

RSpec.describe VirtualCompGroupsController, type: :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/virtual_comp_groups").to route_to("virtual_comp_groups#index")
    end

    it "routes to #new" do
      expect(:get => "/virtual_comp_groups/new").to route_to("virtual_comp_groups#new")
    end

    it "routes to #show" do
      expect(:get => "/virtual_comp_groups/1").to route_to("virtual_comp_groups#show", :id => "1")
    end

    it "routes to #edit" do
      expect(:get => "/virtual_comp_groups/1/edit").to route_to("virtual_comp_groups#edit", :id => "1")
    end

    it "routes to #create" do
      expect(:post => "/virtual_comp_groups").to route_to("virtual_comp_groups#create")
    end

    it "routes to #update" do
      expect(:put => "/virtual_comp_groups/1").to route_to("virtual_comp_groups#update", :id => "1")
    end

    it "routes to #destroy" do
      expect(:delete => "/virtual_comp_groups/1").to route_to("virtual_comp_groups#destroy", :id => "1")
    end

  end
end
