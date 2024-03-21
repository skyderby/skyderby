class ApplicationPolicy
  attr_reader :user, :record

  delegate :admin?, to: :user, allow_nil: true

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index? = admin?

  def show? = scope.exists?(id: record.id)

  def create? = admin?

  def new? = create?

  def update? = admin?

  def edit? = update?

  def destroy? = admin?

  def scope = Pundit.policy_scope!(user, record.class)

  class Scope
    attr_reader :user, :scope

    delegate :admin?, to: :user, allow_nil: true

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve = scope
  end
end
