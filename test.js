// 简单封装了一下
const Jenkins = require('node-async-jenkins-api');
// 配置Jenkins
const jenkins = new Jenkins({
    url: 'http://123.56.55.16:9001',
    username: 'mc',
    password: '116ed7dda26ea8cc346f847ae7ad90def7'
});
// 获取队列信息
async function getQueueInfo() {
    const result = await jenkins.getQueueInfo()
    console.log(result);
    result.data.body.items.forEach((item, index) => {
        console.log(`第${index}个`);
        console.log(item);
        // console.log(item.actions.parameters);
    })
}
// 取消队列中等待的任务 @param recordId
async function cancelQueueItemWithRecordId(recordId) {
    const result = await jenkins.getQueueInfo()
    let queueArray = [...result.data.body.items];
    if (queueArray && queueArray.length) {
        for (let queue of queueArray) {
            const regex = /record_id=(\S*)\nnode_env=/g;
            let result = regex.exec(queue.params);
            if (result && Number(result[1]) === recordId) {
                const result = await jenkins.cancelQueueItem(queue.id)
                console.log(result, 'recordId =', recordId, 'queue.id =', queue.id);
            }
        }
    } else {
        console.log('没找到任务ID：', recordId);
    }
}
// 取消队列中等待的任务和正在执行的任务 @param recordId
async function cancelQueueItemAndBuildWithRecordId(recordId) {
    // 根据recordId清除队列
    const result = await jenkins.getQueueInfo()
    let queueArray = [...result.data.body.items];
    if (queueArray && queueArray.length) {
        for (let queue of queueArray) {
            const regex = /record_id=(\S*)\nnode_env=/g;
            let result = regex.exec(queue.params);
            if (result && Number(result[1]) === recordId) {
                const result = await jenkins.cancelQueueItem(queue.id)
                console.log('队列已删除，返回：', result, 'recordId =', recordId, 'queue.id =', queue.id);
            }
        }
    } else {
        console.log('当前任务ID没有队列：', recordId);
    }
    // 根据recordId清除正在跑的任务
    let jobNameArray = [
        'dds_auto_batch1',
        'dds_auto_batch2',
        'dds_auto_batch3',
        'dds_auto_batch4',
        'dds_auto_batch5',
        'dds_auto_batch6',
    ];
    for (let jobName of jobNameArray) {
        const buildInfoResult = await jenkins.getLastBuildInfo(jobName)
        let stopBuildResult;
        let buildNumber = buildInfoResult.data.body.number; // 任务编号
        let parametersArray = buildInfoResult.data.body.actions.find((item) => item._class === 'hudson.model.ParametersAction').parameters
        let jobRecordId = parametersArray.find((item) => item.name === 'record_id').value
        if (jobRecordId && Number(jobRecordId) === recordId && buildInfoResult.data.body.building) {
            stopBuildResult = await jenkins.stopBuild(jobName, buildNumber)
            console.log('停止的任务为：', jobName);
        } else {
            console.log('当前任务ID没有任务：', recordId);
            console.log(`Job ${jobName} 最后一次任务record_id =`,jobRecordId); // string
        }
    }
}
// 获取某任务上次构建的信息
async function getLastBuildInfo() {
    const result = await jenkins.getLastBuildInfo('dds_auto_batch4')

    // const result = await jenkins.stopBuild('dds_auto_batch1', buildNumber)
    console.log(result);
    console.log(JSON.stringify(result));
}
// 正则测试代码
function test() {
    const regex = /record_id=(\S*)\nnode_env=/g;
    let string = 'record_id=1363\n' +
        'node_env=algo\n';
    let result = regex.exec(string);
    console.log(result);
}
// 主函数
async function main() {
    const arguments = process.argv.splice(2);
    // console.log('所传递的参数是：', arguments);
    if (arguments[0] === '1') {
        // node test.js 1
        await getQueueInfo()
    } else if (arguments[0] === '2') {
        // node test.js 2 1364
        let recordId = parseInt(arguments[1]);
        await cancelQueueItemWithRecordId(recordId)
    } else if (arguments[0] === '3') {
        // node test.js 3
        await getLastBuildInfo()
    } else if (arguments[0] === '4') {
        // node test.js 4 xx
        // node test.js 4 1404
        let recordId = parseInt(arguments[1]);
        await cancelQueueItemAndBuildWithRecordId(recordId)
    } else {
        // node test.js
        test()
    }
}

// 主函数
main()
