// let arr = [1, 2, 3, 4, 5];
// let n = arr.length;
// let temp = arr[0];
// let temp1 = arr[1];

// for (let i = 0; i < n; i++) {
//     arr[i] = arr[i + 2];
// }

// arr[n - 1] = temp;
// arr[n - 2] = temp1;

// console.log(arr);



const input = [1, 2, 3, 4, 5];
let temp = input[0]

for (i = 0; i < input.length; i++) {
    input[i] = input[i + 1];
}

input[input.length - 1] = temp;

console.log(input);