json.key_format! camelize: :lower

json.subscription { json.partial! 'api/v1/shared/subscription', subscription: @subscription }
