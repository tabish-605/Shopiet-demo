import redis


def main():
    service_uri = 'rediss://default:AVNS_c_ggreKP6CxKHCWkpxW@caching-1b09652b-munomaturure-4014.d.aivencloud.com:10153'
    redis_client = redis.from_url(service_uri)

    redis_client.set('key', 'hello world')
    key = redis_client.get('key').decode('utf-8')

    print('The value of key is:', key)


if __name__ == '__main__':
    main()