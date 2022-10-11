describe Api::V1::OrganizersController, type: :request do
  describe 'Speed skydiving competition' do
    describe '#index' do
      it 'when does not have permission' do
        event = speed_skydiving_competitions(:nationals).tap(&:draft!)

        get "/api/v1/speed_skydiving_competitions/#{event.id}/organizers"

        expect(response).to have_http_status(:forbidden)
      end

      it 'when have permissions' do
        organizer_user = users(:regular_user)
        event = speed_skydiving_competitions(:nationals).tap(&:published!)
        event.organizers.create!(user: organizer_user)

        get "/api/v1/speed_skydiving_competitions/#{event.id}/organizers"

        expect(response).to have_http_status(:success)
        expect(response.parsed_body).to match(
          hash_including(
            'items' => [
              {
                'id' => Integer,
                'userId' => organizer_user.id,
                'profileId' => organizer_user.profile.id,
                'createdAt' => String,
                'updatedAt' => String
              }
            ],
            'relations' => {
              'profiles' => [
                hash_including(
                  'id' => organizer_user.profile.id,
                  'name' => organizer_user.profile.name
                )
              ],
              'countries' => []
            }
          )
        )
      end
    end

    describe '#create' do
      it 'when not allowed' do
        event = speed_skydiving_competitions(:nationals)
        organizer_user = users(:regular_user)

        post "/api/v1/speed_skydiving_competitions/#{event.id}/organizers",
             params: { user_id: organizer_user.id }

        expect(response).to have_http_status(:forbidden)
      end

      it 'adds organizer to event' do
        event = speed_skydiving_competitions(:nationals)
        event.update!(responsible: users(:event_responsible))

        new_organizer_user = users(:regular_user)

        sign_in event.responsible

        post "/api/v1/speed_skydiving_competitions/#{event.id}/organizers",
             params: { organizer: { user_id: new_organizer_user.id } }

        expect(response).to have_http_status(:success)
        expect(response.parsed_body).to match(
          hash_including(
            'id' => Integer,
            'userId' => new_organizer_user.id,
            'profileId' => new_organizer_user.profile.id
          )
        )
      end
    end

    describe '#destroy' do
      it 'when not allowed' do
        event = speed_skydiving_competitions(:nationals)
        organizer_user = users(:regular_user)
        organizer = event.organizers.create!(user: organizer_user)

        delete "/api/v1/speed_skydiving_competitions/#{event.id}/organizers/#{organizer.id}"

        expect(response).to have_http_status(:forbidden)
      end

      it 'remopves organizer from event' do
        event = speed_skydiving_competitions(:nationals)
        organizer_user = users(:regular_user)
        organizer = event.organizers.create!(user: organizer_user)

        sign_in event.responsible

        delete "/api/v1/speed_skydiving_competitions/#{event.id}/organizers/#{organizer.id}"

        expect(response).to have_http_status(:success)
        expect(response.parsed_body).to match(
          hash_including(
            'id' => Integer,
            'userId' => organizer.user_id,
            'profileId' => organizer.user.profile.id
          )
        )
      end
    end
  end
end
