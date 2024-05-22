# EventPolicy is used to resolve objects available for select box
describe EventPolicy do
  describe 'guest user can see' do
    visible_event_params = [
      { status: :published, visibility: :public_event },
      { status: :published, visibility: :public_event }
    ]

    visible_event_params.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      it "#{status} #{visibility} events" do
        event = create(:event, status: Event.statuses[status], visibility: Event.visibilities[visibility])
        current_user = GuestUser.new({})

        expect(EventPolicy::Scope.new(current_user, Event).resolve).to include(event)
      end
    end
  end

  describe 'guest user can not see' do
    hidden_event_params = [
      { status: :draft, visibility: :public_event },
      { status: :published, visibility: :unlisted_event },
      { status: :published, visibility: :private_event }
    ]

    hidden_event_params.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      it "#{status} #{visibility} events" do
        event = create(:event, status: Event.statuses[status], visibility: Event.visibilities[visibility])
        current_user = GuestUser.new({})

        expect(EventPolicy::Scope.new(current_user, Event).resolve).not_to include(event)
      end
    end
  end

  describe 'responsible can see his own events in any status' do
    visible_event_params = [
      { status: :draft, visibility: :public_event },
      { status: :draft, visibility: :unlisted_event },
      { status: :draft, visibility: :private_event },
      { status: :published, visibility: :public_event },
      { status: :published, visibility: :unlisted_event },
      { status: :published, visibility: :private_event },
      { status: :finished, visibility: :public_event },
      { status: :finished, visibility: :unlisted_event },
      { status: :finished, visibility: :private_event }
    ]

    visible_event_params.each do |params|
      status = params[:status]
      visibility = params[:visibility]

      it "#{status} #{visibility} events" do
        current_user = create(:user)
        event = create(:event,
                       responsible: current_user,
                       status: Event.statuses[status],
                       visibility: Event.visibilities[visibility])

        expect(EventPolicy::Scope.new(current_user, Event).resolve).to include(event)
      end
    end
  end
end
