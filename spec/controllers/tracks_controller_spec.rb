require 'rails_helper'

describe TracksController, type: :controller do
  context 'as an not registered user' do
    describe '#delete' do
      it 'allowed on have not shown to anyoune track' do
        allow(controller).to receive(:current_user).and_return(nil)

        track = Track.create!(name: 'John', pilot: nil, lastviewed_at: nil)
        allow(Track).to receive(:find).and_return(track)
        expect(track).to receive(:destroy)

        delete :destroy, id: track.id
      end
    end
  end

  context 'as a registered user' do
    describe '#show' do
      it 'allowed to view his own private tracks' do
        user = User.create(email: 'a@x.com', password: '123')
        profile = Profile.create(name: 'John Doe')
        allow(user).to receive(:profile).and_return(profile)
        
        setup_controller_for_show_action(user: user)

        track = Track.create!(pilot: profile, visibility: :private_track)
        allow(Track).to receive(:find).and_return(track)

        get :show, id: track.id
        expect(response).to render_template(:show)
      end

      it 'does not allowed to view someone else private tracks' do
        user = User.create(email: 'a@x.com', password: '123')
        profile = Profile.create(name: 'John Doe')
        allow(user).to receive(:profile).and_return(profile)
        
        setup_controller_for_show_action(user: user)

        another_profile = Profile.create(name: 'Ivan')
        track = Track.create!(pilot: another_profile, visibility: :private_track)
        allow(Track).to receive(:find).and_return(track)

        get :show, id: track.id
        expect(response).to redirect_to(tracks_path)
      end

      def setup_controller_for_show_action(user:)
        allow(controller).to receive(:current_user).and_return(user)
        presenter_class = double
        allow(controller).to receive(:presenter_class).and_return(presenter_class)
        presenter = double
        allow(presenter).to receive(:load)
        allow(presenter_class).to receive(:new).and_return(presenter)
      end
    end

    describe '#delete' do
      it 'allowed on his own track' do
        user = User.create(email: 'a@x.com', password: '123')
        profile = Profile.create(name: 'John Doe')
        allow(user).to receive(:profile).and_return(profile)
        
        allow(controller).to receive(:current_user).and_return(user)

        track = Track.create!(pilot: profile)
        allow(Track).to receive(:find).and_return(track)
        expect(track).to receive(:destroy)

        delete :destroy, id: track.id
      end

      it 'does not allowed on someone else track' do
        user = User.create(email: 'a@x.com', password: '123')
        profile = Profile.create(name: 'John Doe', user: user)
        allow(user).to receive(:profile).and_return(profile)

        another_profile = Profile.create(name: 'Ivan')
        
        allow(controller).to receive(:current_user).and_return(user)

        track = Track.create!(pilot: another_profile)
        allow(Track).to receive(:find).and_return(track)
        expect(track).not_to receive(:destroy)

        delete :destroy, id: track.id
      end

      it 'does not allowed on competition track' do
        user = User.create(email: 'a@x.com', password: '123')
        profile = Profile.create(name: 'John Doe', user: user)
        allow(user).to receive(:profile).and_return(profile)
        
        allow(controller).to receive(:current_user).and_return(user)

        track = Track.create!(pilot: profile)
        allow(Track).to receive(:find).and_return(track)
        allow(track).to receive(:competitive?).and_return(true)

        expect(track).not_to receive(:destroy)

        delete :destroy, id: track.id
      end

      it 'does not allowed to user without profile delete track from not registered user' do
        user = User.create(email: 'a@x.com', password: '123')
        allow(user).to receive(:profile).and_return(nil)
        
        allow(controller).to receive(:current_user).and_return(user)

        track = Track.create!(name: 'John', pilot: nil, lastviewed_at: Date.today)
        allow(Track).to receive(:find).and_return(track)

        expect(track).not_to receive(:destroy)

        delete :destroy, id: track.id
      end
    end
  end
end
